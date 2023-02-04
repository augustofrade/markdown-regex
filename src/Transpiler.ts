export class Transpiler {
    private listLevel: number = 0;
    private isCode: boolean = false;
    private isQuotation: boolean = false;

    constructor(
        private transpilationRef: string[]
    ) {}
    
    private parseTitle(text: string) {
        this.wrapMultiLineValues();

        const titleSize = text.match(/#{1,6}/g)![0].length;
        text = text.substring(titleSize).trim();
        text = `<h${titleSize}>${text}</h${titleSize}>`;
        this.transpilationRef.push(text);
    }

    private parseParagraph(text: string) {
        this.wrapMultiLineValues();

        text = this.parseTags(text.trim());
        this.transpilationRef.push(`<p>${text}</p>`);
        
    }

    private parseTags(text: string): string {
        text = this.parseBold(text);
        text = this.parseItalic(text);
        text = this.parseStrike(text);
        text = this.parseShortCode(text);
        text = this.parseImage(text);
        text = this.parseHiperlink(text);
        return text;
    }

    private parseList(text: string) {
        this.closeLongCode();

        let hifenIndex = text.indexOf("-");
    }

    private parseBold(text: string): string {
        return text.replace(/\*\*.+\*\*/gi, match => `<b>${match.substring(2, match.length - 2)}</b>`);
    }

    private parseItalic(text: string): string {
        return text.replace(/\*.+\*/gi, match => `<i>${match.substring(1, match.length - 1)}</i>`);
    }

    private parseStrike(text: string): string {
        return text.replace(/~~.+~~/gi, match => `<s>${match.substring(2, match.length - 2)}</s>`);
    }

    private parseShortCode(text: string): string {
        return text.replace(/`.+`/gi, match => `<code>${match.substring(1, match.length - 1)}</code>`);
    }

    private parseLongCode(text: string) {
        this.closeList();
        this.closeBlockquote();

        text = text.trim();
        if(!this.isCode)
            text = "<code>\n\t" + text;
        else
            text = "\t" + text;
        this.isCode = true;
        this.transpilationRef.push(text);
    }

    private closeLongCode() {
        if(this.isCode) {
            this.isCode = false;
            this.transpilationRef.push("</code>");
        }
    }

    private parseBlockquote(text: string) {
        this.closeLongCode();
        this.closeList();

        text = text.substring(1).trim();
        text = this.parseTags(text);
        if(!this.isQuotation)
            text = "<blockquote>\n\t" + text;
        else
            text = "\t" + text;
        this.isQuotation = true;
        this.transpilationRef.push(text);
    }

    private closeBlockquote() {
        if(this.isQuotation) {
            this.isQuotation = false;
            this.transpilationRef.push("</blockquote>");
        }
    }

    private parseHiperlink(text: string): string {
        return text.replace(/\[[^\[\]]+\]\([^\(\)]+\)/gi, match => {
            const description = match.substring(1, match.indexOf("]"));
            const hiperlink = match.substring(match.indexOf("(") + 1, match.indexOf(")"));
            return `<a href="${hiperlink}" target="_blank">${description}</a>`;
        })
    }

    private parseImage(text: string): string {
        return text.replace(/!\[[^\[\]]+\]\([^\(\)]+\)/gi, match => {
            const description = match.substring(2, match.indexOf("]"));
            const imagePath = match.substring(match.indexOf("(") + 1, match.indexOf(")"));
            return `<img href="${imagePath}" alt="${description}">`;
        })
    }

    public wrapMultiLineValues(): void {
        this.closeList();
        this.closeLongCode();
        this.closeBlockquote();
    }


    private closeList() {
        // TODO: verify <ol> and<ul>
        if(this.listLevel > 0) {
            this.transpilationRef.push("\t".repeat(this.listLevel - 1) + "</ul>");
            this.listLevel--;
            this.closeList();
        }
    }

    public getRules() {
        return {
            "(^\\s{4,}.+)": this.parseLongCode.bind(this),
            "^>.+": this.parseBlockquote.bind(this),
            "#{1,6}\\s.+": this.parseTitle.bind(this),
            "^(\\s*-\\s).+": this.parseList.bind(this),
            ".+": this.parseParagraph.bind(this)
        }
    }
}