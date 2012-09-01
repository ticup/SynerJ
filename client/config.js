define(['sConfig'], function (config) {
  // all possible DOM Object types
  config.DOMtypes = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
                   'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
                   'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist',
                   'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt',
                   'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form',
                   'frame',
                   'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr',
                   'i', 'iframe', 'img', 'input', 'ins', 'keygen', 'kbd',
                   'label', 'legend', 'li', 'link',
                   'map', 'mark', 'menu', 'meta', 'meter',
                   'nav', 'noscript', 'none',
                   'object', 'ol', 'optgroup', 'option', 'output',
                   'p', 'param', 'pre', 'progress',
                   'q', 'rp' ,'rt', 'ruby',
                   's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'source',
                   'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td',
                   'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
                   'ul', 'var', 'video',
                   'wbr' ];
  // ID of the DOM element that is used as parent of the application
  config.DobjectsParent = 'SynerJ-Objects';
  config.interfaceContainer = 'SynerJ';
  
  return config;
});
