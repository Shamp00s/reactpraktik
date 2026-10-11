import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

function Layout() {
  return (
    // Без обёртки-div — Header/main/Footer должны быть ПРЯМЫМИ детьми #root,
    // у которого уже настроен display:flex; flex-direction:column в index.css.
    // Любая обёртка вокруг них (даже пустой <div>) ломает растягивание на всю высоту.
    <>
      <Header />
      <main className="layout-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Layout;