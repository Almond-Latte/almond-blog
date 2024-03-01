import { useEffect } from "react";
import tocbot from 'tocbot';

const PostTOC = () => {
  useEffect(() => {
    tocbot.init({
      tocSelector: '.toc',
      contentSelector: '.content',
      headingSelector: 'h1, h2',
    })

    return () => tocbot.destroy()
  }, []);

  return (
    <div className="toc" />
  )
};

export default PostTOC;