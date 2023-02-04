import FileVerifier from "./FileVerifier";
import { Transpiler } from "./Transpiler";

import readline from "readline";
import fs from "fs";
import path from "path";

export default class MarkdownConverter {
    private transpiler?: Transpiler;
    private logOnConsole: boolean = false;

    private transpiredLines: string[] = [];
    public constructor (
        private sourceFilePath: string,
        private resultFilePath: string
    ) {
        this.sourceFilePath = new FileVerifier([".md", ".txt"]).verify(sourceFilePath).getPath();
        new FileVerifier([".html"]).verify(resultFilePath, false);

    }

    public convert(): this {
        const sourceFilename = FileVerifier.getFileName(this.sourceFilePath);
        const resultFilename = FileVerifier.getFileName(this.resultFilePath);
        console.log(`Transpilling ${sourceFilename} into ${resultFilename}`);
        this.transpiler = new Transpiler(this.transpiredLines);
        this.readFile();
        return this;

    }

    public toConsole(): void {
        this.logOnConsole = true;
    }

    private readFile() {
        const rl = readline.createInterface({
            input: fs.createReadStream(this.sourceFilePath),
            terminal: false
        });
        rl.on("line", this.parseLine.bind(this));
        rl.on("close", this.onFinish.bind(this));
    }

    private parseLine(line: string) {
        const rules = Object.entries(this.transpiler!.getRules());
        for (const [regex, transpileMethod] of rules) {
            if(new RegExp(regex).test(line)) {
                transpileMethod(line);
                break;
            }
        }
    }

    private onFinish() {
        this.transpiler!.wrapMultiLineValues();
        if(this.logOnConsole)
            this.transpiredLines.forEach(line => console.log(line));
        const fileName = FileVerifier.getFileName(this.sourceFilePath);
        console.log(`\nFinished transpiling ${fileName}`);
        this.saveToFile();
    }

    private saveToFile() {
        const outputAbsolutePath = path.resolve(path.join(__dirname, this.resultFilePath));
        const content = this.transpiredLines.join("\n")
        fs.writeFileSync(outputAbsolutePath, content);
        console.log("HTML results saved to file");
    }
}