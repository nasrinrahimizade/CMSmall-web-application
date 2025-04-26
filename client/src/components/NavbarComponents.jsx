import { Navbar, Container } from 'react-bootstrap';
import { Link , useNavigate} from 'react-router-dom';
import { LogoutButton } from './AuthComponents';

function NavHeader(props) {
  const navigate = useNavigate();

  
  return (
    <Navbar bg="primary" variant="dark">
      <Container fluid>
        <Link to="/" className="navbar-brand">
          {props.websiteName}
        </Link>
        {props.isAdmin && props.loggedIn && (
          <>
            <Link to="/edit-website-name" className="btn btn-outline-light">
              Edit Name
            </Link>
            {/* Add any other admin-specific links/buttons */}
          </>
        )}
        {props.loggedIn ? (
          <LogoutButton logout={props.handleLogout} />
        ) : (
          <Link to="/login" className="btn btn-outline-light">
            Login
          </Link>
        )}
      </Container>
    </Navbar>
  );
}

export default NavHeader;
