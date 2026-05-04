export declare class Collaborators {
    label: string;
}
export declare class InstagramDto {
    post_type: 'post' | 'story';
    is_trial_reel?: boolean;
    graduation_strategy?: 'MANUAL' | 'SS_PERFORMANCE';
    collaborators: Collaborators[];
}
