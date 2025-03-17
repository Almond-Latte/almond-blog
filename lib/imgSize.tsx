import sizeOf from 'image-size';
import { visit } from 'unist-util-visit';
import { Transformer } from 'unified';
import { Node, Data } from 'unist';
import { Element } from 'hast';

interface ImgElement extends Element {
  tagName: 'img';
  properties: {
    src: string;
    width?: number;
    height?: number;
  };
}

function rehypeImageSize(): (tree: Node) => void {
  return (tree: Node) => {
    visit(tree, 'element', (node: ImgElement) => {
      if (node.tagName === 'img') {
        const src = node.properties.src;
        try {
          const { width, height } = sizeOf('public' + src);
          node.properties.width = width;
          node.properties.height = height;
        } catch (error) {
          console.error(`Error getting size of image: ${src}`, error);
        }
      }
    });
  };
}

export default rehypeImageSize;
