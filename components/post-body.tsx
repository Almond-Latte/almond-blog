type Props = {
  content: string;
};

const PostBody = ({ content }: Props) => {
  return (
    <div className='content mx-auto markdown-body'>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default PostBody;
