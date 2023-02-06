### About
Markdown to HTML converter developed for the purpose of learning regex.

It converts:
- [X] Heading
- [X] Bold, italic and Strikethrough
- [X] Code and blockquote
- [X] Image and hiperlink
- [X] Table
- [X] Paragraph
- [ ] Ordered List
- [ ] Unordered List

### Usage
Set it up just like *index.ts*:
```
import MarkdownConverter from "./MarkdownConverter";

const converter = new MarkdownConverter("../source.md", "../result.html");
converter.convert();
```

To view the HTML results of the conversion, just use the method `.toConsole()` after the `.convert()` call.
Also, any relative path for the I/O files will be converted to its absolute path.