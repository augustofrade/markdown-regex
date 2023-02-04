import FileVerifier from "./FileVerifier";
import { Transpiler } from "./Transpiler";

import readline from "readline";
import fs from "fs";

export default class MarkdownConverter {
    private transpiler?: Transpiler;

    private transpiredLines: string[] = [];
    public constructor (
        private sourceFilePath: string,
        private resultFilePath: string
    ) {
        this.sourceFilePath = new FileVerifier([".md", ".txt"]).verify(sourceFilePath).getPath();
        new FileVerifier([".html"]).verify(resultFilePath, false);

    }

    public convert() {
        const sourceFilename = FileVerifier.getFileName(this.sourceFilePath);
        const resultFilename = FileVerifier.getFileName(this.resultFilePath);
        console.log(`Transpilling ${sourceFilename} into ${resultFilename}`);
        this.transpiler = new Transpiler(this.transpiredLines);
        const success = this.readFile();

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
        // this.transpiredLines.forEach(line => console.log(line));
        const fileName = FileVerifier.getFileName(this.sourceFilePath);
        console.log(`\nFinished transpiling ${fileName}`);
    }
}