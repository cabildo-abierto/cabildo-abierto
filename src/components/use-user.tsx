import { getUserId } from '@/actions/get-user';
import { useEffect, useState } from 'react';

const useUser = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      console.log("Setting user id", id)
      setUserId(id);
    };

    fetchUserId();
  }, []);

  return userId;
};

export default useUser;