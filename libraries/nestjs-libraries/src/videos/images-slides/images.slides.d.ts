import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import { URL, VideoAbstract } from '@gitroom/nestjs-libraries/videos/video.interface';
import { FalService } from '@gitroom/nestjs-libraries/openai/fal.service';
declare class ImagesSlidesParams {
    voice: string;
    prompt: string;
}
export declare class ImagesSlides extends VideoAbstract<ImagesSlidesParams> {
    private _openaiService;
    private _falService;
    dto: typeof ImagesSlidesParams;
    private storage;
    constructor(_openaiService: OpenaiService, _falService: FalService);
    process(output: 'vertical' | 'horizontal', customParams: ImagesSlidesParams): Promise<URL>;
    loadVoices(data: any): Promise<{
        voices: any;
    }>;
}
export {};
