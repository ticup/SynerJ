define([], function () {

  var cssProps = ["border", "border-radius", "margin", "padding", "transition",
                  "-moz-transition", "-webkit-transition"];

  return {
    cssProps: cssProps,
    objectsParent: 'SynerJ-Objects',
    dobjectsParent: 'visual-objects',
    normalObjectsParent: 'normal-objects',
    port: 2290,
    url: 'localhost'
  };
});
