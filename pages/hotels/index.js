import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import axios from '../../config/apiConfig';
import HotelItem from '../../components/hotels/HotelItem';
import SearchBar from '../../components/searchbar/SearchBar';
import FeaturedRecommendations from '../../components/hotels/FeaturedRecommendations';
import useData from '../../utils/useData/useData';
import usePrevious from '../../utils/usePrevious/usePrevious';
import { useSearchQuery } from '../../context/searchQueryContext';

export default function Hotels(props) {
  const { initialHotels } = props;

  const router = useRouter();
  const { query } = router;

  const [searchQuery, setSearchQuery] = useSearchQuery();

  const [{ data, isLoading, isError }, fetchData] = useData(
    '/hotels',
    searchQuery,
    initialHotels
  );

  const previousQuery = usePrevious(router.query);

  // API data object returns { data, pagination }
  const hotelsData = data;
  const hotelsList = hotelsData.data;
  const { pagination } = hotelsData;

  useEffect(() => {
    fetchData(searchQuery);
  }, [searchQuery['country[eq]'], searchQuery.start, searchQuery.end]);

  useEffect(() => {
    if (previousQuery !== router.query) {
      setSearchQuery(router.query);
    }
  }, [router.query['country[eq]'], router.query.start, router.query.end]);

  const searchBarOnUpdateHandler = (destination, startDate, endDate) => {
    setSearchQuery({
      ...(destination && { ['country[eq]']: destination }),
      ...(startDate && endDate && { start: startDate, end: endDate }),
    });
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...(destination && { ['country[eq]']: destination }),
          ...(startDate && endDate && { start: startDate, end: endDate }),
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const renderList = list => {
    return (
      <ul className="flex flex-col p-2 w-full 2xl:w-4/5">
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
      <Head>
        <title>
          Hotels |{' '}
          {query['country[eq]']
            ? query['country[eq]']
            : 'Where do you want to go?'}{' '}
          {query.start && query.end && `- ${query.start}-${query.end}`}
        </title>
      </Head>
      <SearchBar
        {...props}
        buttonName="Update"
        onUpdateHandler={searchBarOnUpdateHandler}
      />
      <div className="flex flex-col flex-grow justify-start items-center w-full bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center w-full">
            Loading...
          </div>
        ) : hotelsList.length > 0 ? (
          renderList(hotelsList)
        ) : (
          <div className="flex flex-col items-center justify-center py-2 w-full 2xl:w-4/5 bg-gray-50">
            <p className="p-4 w-full text-center bg-white">
              Sorry, there are no hotels available for your destination or
              dates.
            </p>
          </div>
        )}
        <FeaturedRecommendations />
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const { query } = ctx;
  const session = await getSession(ctx);
  const res = await axios.get('/hotels', { params: query });
  // console.log('SSR AXIOS RES', res);

  const data = await res.data;

  return {
    props: {
      initialHotels: data,
      session,
    },
  };
}
