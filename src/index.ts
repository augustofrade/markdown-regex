import MarkdownConverter from "./MarkdownConverter";

const converter = new MarkdownConverter("../source.md", "../result.html");
converter.convert().toConsole();

// console.log(new RegExp("^(\\s*-\\s).+", "gi").test("- ewaewa"))