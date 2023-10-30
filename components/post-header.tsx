import DateFormatter from './date-formatter';
import PostTitle from './post-title';

type Props = {
  title: string;
  date: string;
};

const PostHeader = ({ title, date }: Props) => {
  return (
    <div className='py-16 text-center'>
      <PostTitle>{title}</PostTitle>
      <div className='text-zinc-600'>
        <DateFormatter dateString={date} />
      </div>
    </div>
  );
};

export default PostHeader;
