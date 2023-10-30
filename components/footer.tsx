import { getYear } from 'date-fns';
import Container from './container';

const Footer = () => {
  const date = new Date();
  return (
    <footer className='bg-neutral-50 border-t border-neutral-200'>
      <Container>
        <div className='py-10 text-center text-zinc-500'>
          <p>&copy; Copyright {getYear(date)} Almond Latte. All Rights Reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
