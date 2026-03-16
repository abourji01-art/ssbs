import { Outlet } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const DriverLayout = () => {
  useDocumentTitle('Driver — Fleetmark 1337');
  return <Outlet />;
};

export default DriverLayout;
