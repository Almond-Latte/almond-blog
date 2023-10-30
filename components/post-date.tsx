import DateFormatter from './date-formatter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { faCalendarPlus } from '@fortawesome/free-regular-svg-icons';
type Props = {
  postDate: string;
  updateDate: string;
};

const PostDate = ({ postDate, updateDate }: Props) => {
  return (
    <div className='text-zinc-600 text-sm flex'>
      最終更新&thinsp;
      <FontAwesomeIcon icon={faRotateRight} className='w-4' />
      &nbsp;
      <DateFormatter dateString={updateDate} />
      &emsp; 公開&thinsp;
      <FontAwesomeIcon icon={faCalendarPlus} className='w-4' />
      &nbsp;
      <DateFormatter dateString={postDate} />
    </div>
  );
};

export default PostDate;
