import fs from "fs";
import path from "path";

export default class FileVerifier {
    private filePath: string = "";

    public constructor(private acceptedFormats: string[]) {}

    public verify(filePath: string, fileShouldExist: boolean = true): this {
        const absolutePath = path.resolve(path.join(__dirname, filePath)); 
        this.filePath = absolutePath;

        this.verifyExtension(absolutePath);
        this.verifyIntegrity(absolutePath, fileShouldExist);

        return this;
    }

    private verifyExtension(filePath: string): void {
        const extension: string = filePath.substring(filePath.lastIndexOf("."));  
        if(!this.acceptedFormats.includes(extension))
            throw { name: "FileExtensionError", message: `Invalid file extension: "${extension}" for file "${filePath}"` };
    }

    private verifyIntegrity(filePath: string, fileShouldExist: boolean = true): void { 
        if(fileShouldExist && !fs.existsSync(filePath))
            throw { name: "InvalidFileError", message: `There's no such file as "${filePath}"` };
    }

    public getPath(): string {
        return this.filePath;
    }

    public static getFileName(filePath: string): string {
        filePath = filePath.replace(/\\/g, "/");
        return filePath.substring(filePath.lastIndexOf("/") + 1);
    }
}