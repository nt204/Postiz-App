"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handleR2Upload;
exports.simpleUpload = simpleUpload;
exports.createMultipartUpload = createMultipartUpload;
exports.prepareUploadParts = prepareUploadParts;
exports.listParts = listParts;
exports.completeMultipartUpload = completeMultipartUpload;
exports.abortMultipartUpload = abortMultipartUpload;
exports.signPart = signPart;
const tslib_1 = require("tslib");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const path_1 = tslib_1.__importDefault(require("path"));
const make_is_1 = require("../services/make.is");
const { fromBuffer } = require('file-type');
const ALLOWED_EXT_TO_MIME = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.bmp': 'image/bmp',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.mp4': 'video/mp4',
};
function normalizeExtension(filename) {
    const ext = path_1.default.extname(filename || '').toLowerCase();
    return ALLOWED_EXT_TO_MIME[ext] ? ext : null;
}
const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ACCESS_KEY, CLOUDFLARE_SECRET_ACCESS_KEY, CLOUDFLARE_BUCKETNAME, CLOUDFLARE_BUCKET_URL, } = process.env;
const R2 = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: CLOUDFLARE_ACCESS_KEY,
        secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
    },
});
function generateRandomString() {
    return (0, make_is_1.makeId)(20);
}
async function handleR2Upload(endpoint, req, res) {
    switch (endpoint) {
        case 'create-multipart-upload':
            return createMultipartUpload(req, res);
        case 'prepare-upload-parts':
            return prepareUploadParts(req, res);
        case 'complete-multipart-upload':
            return completeMultipartUpload(req, res);
        case 'list-parts':
            return listParts(req, res);
        case 'abort-multipart-upload':
            return abortMultipartUpload(req, res);
        case 'sign-part':
            return signPart(req, res);
    }
    return res.status(404).end();
}
async function simpleUpload(data, originalFilename, _contentType) {
    const detected = await fromBuffer(data);
    if (!detected || !Object.values(ALLOWED_EXT_TO_MIME).includes(detected.mime)) {
        throw new Error('Unsupported file type.');
    }
    const fileExtension = `.${detected.ext}`;
    const safeContentType = detected.mime;
    const randomFilename = generateRandomString() + fileExtension;
    const params = {
        Bucket: CLOUDFLARE_BUCKETNAME,
        Key: randomFilename,
        Body: data,
        ContentType: safeContentType,
    };
    const command = new client_s3_1.PutObjectCommand({ ...params });
    await R2.send(command);
    return CLOUDFLARE_BUCKET_URL + '/' + randomFilename;
}
async function createMultipartUpload(req, res) {
    const { file, fileHash } = req.body;
    const safeExt = normalizeExtension(file?.name || '');
    if (!safeExt) {
        return res.status(400).json({ message: 'Unsupported file type.' });
    }
    const safeContentType = ALLOWED_EXT_TO_MIME[safeExt];
    const randomFilename = generateRandomString() + safeExt;
    try {
        const params = {
            Bucket: CLOUDFLARE_BUCKETNAME,
            Key: `${randomFilename}`,
            ContentType: safeContentType,
            Metadata: {
                'x-amz-meta-file-hash': fileHash,
            },
        };
        const command = new client_s3_1.CreateMultipartUploadCommand({ ...params });
        const response = await R2.send(command);
        return res.status(200).json({
            uploadId: response.UploadId,
            key: response.Key,
        });
    }
    catch (err) {
        console.log('Error', err);
        return res.status(500).json({ source: { status: 500 } });
    }
}
async function prepareUploadParts(req, res) {
    const { partData } = req.body;
    const parts = partData.parts;
    const response = {
        presignedUrls: {},
    };
    for (const part of parts) {
        try {
            const params = {
                Bucket: CLOUDFLARE_BUCKETNAME,
                Key: partData.key,
                PartNumber: part.number,
                UploadId: partData.uploadId,
            };
            const command = new client_s3_1.UploadPartCommand({ ...params });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(R2, command, { expiresIn: 3600 });
            response.presignedUrls[part.number] = url;
        }
        catch (err) {
            console.log('Error', err);
            return res.status(500).json(err);
        }
    }
    return res.status(200).json(response);
}
async function listParts(req, res) {
    const { key, uploadId } = req.body;
    try {
        const params = {
            Bucket: CLOUDFLARE_BUCKETNAME,
            Key: key,
            UploadId: uploadId,
        };
        const command = new client_s3_1.ListPartsCommand({ ...params });
        const response = await R2.send(command);
        return res.status(200).json(response['Parts']);
    }
    catch (err) {
        console.log('Error', err);
        return res.status(500).json(err);
    }
}
async function completeMultipartUpload(req, res) {
    const { key, uploadId, parts } = req.body;
    try {
        const command = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: CLOUDFLARE_BUCKETNAME,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: { Parts: parts },
        });
        const response = await R2.send(command);
        const safeExt = normalizeExtension(key || '');
        if (!safeExt) {
            await R2.send(new client_s3_1.DeleteObjectCommand({ Bucket: CLOUDFLARE_BUCKETNAME, Key: key }));
            return res.status(400).json({ message: 'Unsupported file type.' });
        }
        const expectedMime = ALLOWED_EXT_TO_MIME[safeExt];
        const head = await R2.send(new client_s3_1.GetObjectCommand({
            Bucket: CLOUDFLARE_BUCKETNAME,
            Key: key,
            Range: 'bytes=0-4100',
        }));
        const chunks = [];
        for await (const chunk of head.Body) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const prefix = Buffer.concat(chunks);
        const detected = await fromBuffer(prefix);
        if (!detected || detected.mime !== expectedMime) {
            await R2.send(new client_s3_1.DeleteObjectCommand({ Bucket: CLOUDFLARE_BUCKETNAME, Key: key }));
            return res
                .status(400)
                .json({ message: 'File contents do not match declared type.' });
        }
        response.Location =
            process.env.CLOUDFLARE_BUCKET_URL +
                '/' +
                response?.Location?.split('/').at(-1);
        return response;
    }
    catch (err) {
        console.log('Error', err);
        return res.status(500).json(err);
    }
}
async function abortMultipartUpload(req, res) {
    const { key, uploadId } = req.body;
    try {
        const params = {
            Bucket: CLOUDFLARE_BUCKETNAME,
            Key: key,
            UploadId: uploadId,
        };
        const command = new client_s3_1.AbortMultipartUploadCommand({ ...params });
        const response = await R2.send(command);
        return res.status(200).json(response);
    }
    catch (err) {
        console.log('Error', err);
        return res.status(500).json(err);
    }
}
async function signPart(req, res) {
    const { key, uploadId } = req.body;
    const partNumber = parseInt(req.body.partNumber);
    const params = {
        Bucket: CLOUDFLARE_BUCKETNAME,
        Key: key,
        PartNumber: partNumber,
        UploadId: uploadId,
        Expires: 3600,
    };
    const command = new client_s3_1.UploadPartCommand({ ...params });
    const url = await (0, s3_request_presigner_1.getSignedUrl)(R2, command, { expiresIn: 3600 });
    return res.status(200).json({
        url: url,
    });
}
//# sourceMappingURL=r2.uploader.js.map