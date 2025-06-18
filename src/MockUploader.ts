export interface Uploader {
  upload: (url: string | ArrayBuffer) => void;
  abort: () => void;
}

export interface Upload {
  file: File;
  uploader: Uploader;
}

export class MockUploader implements Uploader {
  public onprogress: (percent: number) => void = (_: number) => {/** do nothing */};
  public onabort: () => void = () => {/** do nothing */};
  public onfail: (err: string) => void = (_: string) => {/** do nothing */};
  public oncomplete: () => void = () => {/** do nothing */};

  upload(_url: string | ArrayBuffer) {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.oncomplete();
      }
      this.onprogress(progress);
    }, 200);
  }

  abort() {
    this.onabort();
  }
}
