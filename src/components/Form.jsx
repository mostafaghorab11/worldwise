import { useEffect, useState } from 'react';

import Button from './Button';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useNavigate } from 'react-router-dom';
import { useCities } from '../contexts/CitiesContext';
import { useUrlPosition } from '../hooks/useUrlPosition';
import BackButton from './BackButton';
import styles from './Form.module.css';
import Message from './Message';
import Spinner from './Spinner';

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

function Form() {
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [emoji, setEmoji] = useState('');
  const [geoLocationError, setGeoLocationError] = useState('');

  const { createCity, isLoading } = useCities();

  const [lat, lng] = useUrlPosition();

  const navigate = useNavigate();

  useEffect(
    function () {
      async function fetchCityData() {
        if (!lat && !lng) return;

        try {
          setIsLoadingGeocoding(true);
          setGeoLocationError('');
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          const data = await res.json();
          console.log(data);

          if (!data.countryCode)
            throw new Error(
              "This doesn't seem to be a city , please click somewhere else"
            );

          setCityName(data.city || data.localityInfo.Qatar.city);
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (error) {
          setGeoLocationError(error.message);
        } finally {
          setIsLoadingGeocoding(false);
        }
      }

      fetchCityData();
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    await createCity(newCity);
    navigate('/app/cities');
  }

  if (isLoadingGeocoding) return <Spinner />;

  if (!lat && !lng) return <Message message="Start by clicking on the map" />;

  if (geoLocationError) return <Message message={geoLocationError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ''}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>

        <DatePicker
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
          id="date"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
