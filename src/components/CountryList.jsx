import Message from './Message';
import Spinner from './Spinner';

import CountryItem from './CountryItem';
import styles from './CountryList.module.css';
import { useCities } from '../contexts/CitiesContext';

function CountryList() {
  const { cities, isLoading } = useCities();
  if (isLoading) return <Spinner />;

  if (cities.length === 0)
    return (
      <Message message="Add your first city by clicking on city on the map" />
    );

  const countries = cities.reduce((arr, city) => {
    if (arr.map((item) => item.country).includes(city.country)) return [...arr];
    else return [...arr, { country: city.country, emoji: city.emoji }];
  }, []);

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem country={country} key={country.country} />
      ))}
    </ul>
  );
}

export default CountryList;
