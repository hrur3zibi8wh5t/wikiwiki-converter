$(function () {
  $("#copy").on("click", function () {
    const resultTxt = $("#result").val();
    navigator.clipboard.writeText(resultTxt);

    this.innerText = "copied !!";
    setTimeout(() => (this.innerText = "copy"), 1000);
  });

  $("#convert").on("click", function () {
    const convertedTxt = convert2($("#source").val());
    $("#result").val(convertedTxt);
  });
});

let opencloseCount = 0;

/**
 *
 * @param {string} input
 * @returns {string}
 */
function convert2(input) {
  const lines = input.split(/\r\n|\n|\r/);
  return lines
    .map((line) => {
      const closeCurlyBrackets = line.match(/^\}$/);
      if (closeCurlyBrackets && opencloseCount > 0) {
        opencloseCount--;
        return "}}";
      }
      const sharp = line.match(/^#(\w+)(?:\((.*?)\))?(?:\{(.*\}?))?/);
      if (sharp) return convetTag(sharp[0], sharp[1], sharp[2], sharp[3]);
      const dotList = line.match(/^・(.*)?/);
      if (dotList) return `-${convetInline(dotList[1])}`;
      return convetInline(line);
    })
    .join("\n");
}

/**
 *
 * @param {string} input
 * @returns {string}
 */
function convetInline(line) {
  if (!line) return "";
  return line.replace(
    /&(\w+)(?:\((.*?)\))?(?:\{((?:[^{}]|(?:\{(?:[^{}])*?\}))*)\})?/g,
    convetTag
  );
  //return line.replace(/&(\w+)(?:\((.*?)\))?(?:\{(.*)\})?/g, convetTag);
}

/**
 *
 * @param {string} match
 * @param {string} tag
 * @param {string} paramStr
 * @param {string} content
 * @returns {string}
 */
function convetTag(match, tag, paramStr, content) {
  const args = paramStr ? paramStr.split(",") : [];

  let innerText = "";
  switch (tag) {
    // 中央寄せ
    case "center":
      innerText = convetInline(
        content.endsWith("}") ? content.slice(0, -1) : content
      );
      return `CENTER:${innerText}`;
    // 右寄せ
    case "right":
      innerText = convetInline(
        content.endsWith("}") ? content.slice(0, -1) : content
      );
      return `RIGHT:${innerText}`;
    // 引用
    case "blockquote":
      innerText = convetInline(
        content.endsWith("}") ? content.slice(0, -1) : content
      );
      return `>${innerText}`;
    // 強調
    case "bold":
    case "b":
      innerText = convetInline(content);
      return `''${innerText}''`;
    // 斜体
    case "italic":
      innerText = convetInline(content);
      return `'''${innerText}'''`;
    // 打消
    case "del":
    case "s":
    case "strike":
      innerText = convetInline(content);
      return `%%${innerText}%%`;
    // 下線
    case "u":
      innerText = convetInline(content);
      return `%%%${innerText}%%%`;
    // ルビ
    case "ruby":
      innerText = convetInline(content);
      return `&ruby(${paramStr}){${innerText}};`;
    // 文字サイズ
    case "size":
      innerText = convetInline(content);
      return `&size(${paramStr}){${innerText}};`;
    case "sizex":
      innerText = convetInline(content);
      return `&sizex(${paramStr}){${innerText}};`;
    case "big":
      innerText = convetInline(content);
      return `&sizex(4){${innerText}};`;
    // 注釈
    case "footnote":
      innerText = convetInline(paramStr);
      return `((${innerText}))`;
    // 折り畳み(開始)
    case "region":
      innerText = convetInline(paramStr);
      return `#fold(${innerText}){{`;
    // 折り畳み(開始)
    case "openclose":
      opencloseCount++;
      innerText = paramStr.replace("show=", "");
      return `#fold(${innerText}){{`;
    // 折り畳み(終了)
    case "endregion":
      return "}}";
    // 文字色
    case "color":
      innerText = convetInline(content);
      return `&color(${paramStr}){${innerText}};`;
    // フォント
    case "font":
      let fontConverted = convetInline(content);

      // 装飾系を除外
      const fontColorAndSizesArgs = args.filter(function (arg) {
        return !["b", "i", "l", "u"].includes(arg);
      });

      // サイズ以外(=色)
      const fontColorArgs = fontColorAndSizesArgs.filter(function (arg) {
        const match = arg.match(/^(\d+)(?:px|%|pt|em)?$/g);
        return !match;
      });
      if (fontColorArgs.length)
        fontConverted = `&color(${fontColorArgs.join(",")}){${fontConverted}};`;

      // サイズ
      var fontSizeArgs = fontColorAndSizesArgs.filter(function (arg) {
        const match = arg.match(/^(\d+)(?:px|%|pt|em)?$/g);
        return match;
      });
      if (fontSizeArgs.length)
        fontConverted = `&size(${fontSizeArgs[0].replace(
          /px|%|pt|em/g,
          ""
        )}){${fontConverted}};`;

      // 装飾
      if (args.includes("b")) fontConverted = `''${fontConverted}''`;
      if (args.includes("i")) fontConverted = `'''${fontConverted}'''`;
      if (args.includes("l")) fontConverted = `%%${fontConverted}%%`;
      if (args.includes("u")) fontConverted = `%%%${fontConverted}%%%`;
      return fontConverted;
    // 改行
    case "br":
      return `&br;`;
  }

  return match;
}
