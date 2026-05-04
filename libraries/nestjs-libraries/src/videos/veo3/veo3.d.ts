import { URL, VideoAbstract } from '@gitroom/nestjs-libraries/videos/video.interface';
declare class Image {
    id: string;
    path: string;
}
declare class Veo3Params {
    prompt: string;
    images: Image[];
}
export declare class Veo3 extends VideoAbstract<Veo3Params> {
    dto: typeof Veo3Params;
    process(output: 'vertical' | 'horizontal', customParams: Veo3Params): Promise<URL>;
}
export {};
