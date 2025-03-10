import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const fetchData = async () => {
  try {
    const response = await axios.get(`${apiUrl}/data`);
    console.log(response.data);
  } catch (error) {
    console.error("There was an error!", error);
  }
};

useEffect(() => {
  fetchData();
}, []);
