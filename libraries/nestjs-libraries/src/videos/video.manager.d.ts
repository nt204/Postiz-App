import { ModuleRef } from '@nestjs/core';
import { VideoAbstract, VideoParams } from '@gitroom/nestjs-libraries/videos/video.interface';
export declare class VideoManager {
    private _moduleRef;
    constructor(_moduleRef: ModuleRef);
    getAllVideos(): {
        identifier: string;
        title: string;
        dto: any;
        description: string;
        target: VideoAbstract<any>;
        tools: {
            functionName: string;
            output: string;
        }[];
        placement: string;
        trial: boolean;
    }[];
    checkAvailableVideoFunction(method: any): boolean;
    getVideoByName(identifier: string): (VideoParams & {
        instance: VideoAbstract<any>;
    }) | undefined;
}
