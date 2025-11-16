export type AuthorStatus = {
    isAuthor: boolean;
    seenAuthorTutorial: boolean;
};
export type FeedFormatOption = "Todos" | "Artículos";
export type EnDiscusionMetric = "Me gustas" | "Interacciones" | "Popularidad relativa" | "Recientes";
export type EnDiscusionTime = "Último día" | "Última semana" | "Último mes" | "Último año";
export type FollowingFeedFilter = "Todos" | "Solo Cabildo Abierto";
export type TTOption = EnDiscusionTime | "Ediciones recientes";
export type AlgorithmConfig = {
    following?: {
        filter?: FollowingFeedFilter;
        format?: FeedFormatOption;
    };
    enDiscusion?: {
        time?: EnDiscusionTime;
        metric?: EnDiscusionMetric;
        format?: FeedFormatOption;
    };
    topicMentions?: {
        time?: EnDiscusionTime;
        metric?: EnDiscusionMetric;
        format?: FeedFormatOption;
    };
    tt?: {
        time?: TTOption;
    };
};
export type MirrorStatus = "Sync" | "Dirty" | "InProcess" | "Failed" | "Failed - Too Large";
export type EditorStatus = "Beginner" | "Editor" | "Administrator";
export type ValidationState = "org" | "persona" | string | null;
export type Session = {
    platformAdmin: boolean;
    authorStatus: AuthorStatus | null;
    editorStatus: EditorStatus;
    seenTutorial: {
        topics: boolean;
        home: boolean;
        topicMinimized: boolean;
        topicMaximized: boolean;
    };
    seenVerifiedNotification: boolean;
    handle: string;
    displayName: string | null;
    avatar: string | null;
    did: string;
    hasAccess: boolean;
    validation: ValidationState;
    algorithmConfig: AlgorithmConfig;
    mirrorStatus: MirrorStatus;
};
//# sourceMappingURL=types.d.ts.map