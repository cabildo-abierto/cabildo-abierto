export type ImageContent = {fileId: string; widthPercent: number; alignment: 'left' | 'center' | 'right'; flow: 'separate' | 'wrap'; alt: string; caption: string};
export type ImageAssetOutput = {fileId: string; fileName: string; width: number; height: number; url: string; expiresAt: number};
export type ImportImageInput = {url: string};
