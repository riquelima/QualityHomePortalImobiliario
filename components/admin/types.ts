export interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  id: string;
}