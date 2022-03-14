import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../../config/apiConfig';
import useData from '../../utils/useData/useData';
import HotelItem from './HotelItem';

export default function FeaturedRecommendations(props) {
  const router = useRouter();
  const { query } = router;

  const [featuredList, setFeaturedList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const res = await axios('/hotels', {
        params: {
          hotelIds: ['0e25533a-2db2-4894-9db1-4c1ff92d798c'],
        },
      });
      setFeaturedList(res.data);
    }
    fetchData();
  }, []);

  const renderList = list => {
    return (
      <ul className="flex flex-col p-2 w-full">
        {list.map(hotel => (
          <HotelItem
            key={hotel.hotelId}
            hotel={hotel}
            destination={router.query['country[eq]']}
            startDate={router.query.start || ''}
            endDate={router.query.end || ''}
          />
        ))}
      </ul>
    );
  };
  return (
    <>
      <div className="flex flex-col items-center p-2 w-full 2xl:w-4/5 bg-indigo-50">
        <div className="flex justify-center p-4 h-1/4 w-full">
          <p className="text-2xl font-light font-sans text-indigo-900">
            Our Featured Hotels
          </p>
        </div>
        {featuredList.data && renderList(featuredList.data)}
      </div>
    </>
  );
}
