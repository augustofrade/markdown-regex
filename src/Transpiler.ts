export class Transpiler {
    private listLevel: number = 0;

    constructor(
        private transpilationRef: string[]
    ) {}
    
    private convertTitle(text: string) {
        this.verifyEndOfList();

        const titleSize = text.match(/#{1,6}/g)![0].length;
        text = text.substring(titleSize).trim();
        text = `<h${titleSize}>${text}</h${titleSize}>`;
        this.transpilationRef.push(text);
    }

    private convertParagraph(text: string) {
        text = this.convertBold(text);
        text = this.convertItalic(text);
        text = this.convertStrike(text);
        text = this.convertShortCode(text);
        this.transpilationRef.push(text);
        
    }

    private convertBold(text: string): string {
        return text.replace(/\*\*.+\*\*/gi, match => `<b>${match.substring(2, match.length - 2)}</b>`);
    }

    private convertItalic(text: string): string {
        return text.replace(/\*.+\*/gi, match => `<i>${match.substring(1, match.length - 1)}</i>`);
    }

    private convertStrike(text: string): string {
        return text.replace(/~~.+~~/gi, match => `<s>${match.substring(2, match.length - 2)}</s>`);
    }

    private convertShortCode(text: string): string {
        return text.replace(/`.+`/gi, match => `<code>${match.substring(2, match.length - 2)}</code>`);
    }


    private verifyEndOfList() {
        // TODO: verify <ol>
        if(this.listLevel > 0) {
            this.transpilationRef.push("</ul>");
            this.listLevel--;
        }
    }

    public getRules() {
        return {
            "#{1,6}\\s.+": this.convertTitle.bind(this),
            ".+": this.convertParagraph.bind(this)
        }
    }
}