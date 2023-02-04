import MarkdownConverter from "./MarkdownConverter";

const converter = new MarkdownConverter("../source.md", "../result.html");
converter.convert().toConsole();