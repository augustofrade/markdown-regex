export class Transpiler {
    private listLevel: number = 0;
    private isCode: boolean = false;
    private isQuotation: boolean = false;
    private table: { open: boolean, header: string[], rawHeader: string, body: string[][] } = {
        open: false,
        header: [],
        rawHeader: "",
        body: []
    };

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
        this.wrapMultiLineValues("-code");

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
        this.wrapMultiLineValues("-quote");

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

    private parseTable(text: string) {
        if(this.table.header.length === 0) {
            this.table.rawHeader = text;
            const headerRow = this.genTableRow(text);
            this.table.header.push(...headerRow);

        } else if(this.table.open) {
            const bodyRow = this.genTableRow(text);
            this.table.body.push(bodyRow);
        } else {
            // Reset table if there's a header already but no divisory line
            this.closeTable();
            this.transpilationRef.push("<p>" + this.parseTags(text) + "</p>");
            this.table.header = [];
        }
    }

    private genTableRow(text: string): string[] {
        let rowCells = text.split("|").map(cell => this.parseTags(cell.trim()));
        rowCells = rowCells.filter(cell => cell !== "");
        return rowCells;
    }

    private parseTableLine(text: string) {
        this.table.open = true;
    }

    private closeTable() {
        if(this.table.header.length > 0 && !this.table.open) {
            // If only the header was parsed without the divisory line
            const parsedLine = this.parseTags(this.table.rawHeader);
            this.transpilationRef.push("<p>" + parsedLine + "</p>");

        } else if((this.table.open && this.table.body.length === 0) || this.table.body.length > 0) {
            // If found divisory line but no body was found during parsing
            const tableHeader = this.table.header.map(cell => "\t\t<th>" + cell + "</th>");
            this.transpilationRef.push("<table>", "\t<tr>", ...tableHeader, "\t</tr>", "</table>");

        }
        if(this.table.body.length > 0) {
            // Full table found
            this.transpilationRef.pop();
            this.table.body.forEach(row => {
                this.transpilationRef.push("\t<tr>");
                row.forEach(cell => {
                    this.transpilationRef.push("\t\t<td>" + cell + "</td>");
                });
                this.transpilationRef.push("\t</tr>");
            })
            this.transpilationRef.push("</table>");
        }

        this.table.open = false;
        this.table.rawHeader = "";
        this.table.header = [];
        this.table.body = [];
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

    public wrapMultiLineValues(exclude: string = ""): void {
        if(!exclude.includes("-table"))
            this.closeTable();
        if(!exclude.includes("-list"))
            this.closeList();
        if(!exclude.includes("-code"))
            this.closeLongCode();
        if(!exclude.includes("-quote"))
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
            "\\|?-+\\|-+\\|?": this.parseTableLine.bind(this),
            ".+\\|.+": this.parseTable.bind(this),
            ".+": this.parseParagraph.bind(this)
        }
    }
}