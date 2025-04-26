import 'bootstrap-icons/font/bootstrap-icons.css';
import { Row, Col, Button } from 'react-bootstrap';
import { Link  } from 'react-router-dom';

export default function PagesList(props) {

  const currentDate = new Date(); // Get the current date

  const publishedPages = props.pages.filter((page) => {
    const publicationDate = new Date(page.publicationDate);
    return publicationDate <= currentDate; // Compare publication date with current date
  });

  const shownpages = props.loggedIn ? props.pages : publishedPages;
  const sortedPages = shownpages.sort((a, b) => {
    const dateA = new Date(a.publicationDate);
    const dateB = new Date(b.publicationDate);
  
    // Handle invalid dates
    if (isNaN(dateA) && isNaN(dateB)) {
      return 0; // Both dates are invalid, keep the order unchanged
    } else if (isNaN(dateA)) {
      return 1; // Only dateA is invalid, move it to the end
    } else if (isNaN(dateB)) {
      return -1; // Only dateB is invalid, move it to the end
    } else {
      return dateA - dateB; // Compare valid dates normally
    }
  });

  ;
  return (
    <>
      <Row>
        <Col>
          <h1>Welcome to My CMSmall project</h1>
          <p className='lead'>We now have {sortedPages.length} pages available.</p>
        </Col>
      </Row>
      <Row>
        <dl>
          {
            sortedPages.map((p) => <PageRow page={p} key={p.id} loggedIn={props.loggedIn} deletePage={props.deletePage}/>)
          }
        </dl>
      </Row>

      {props.loggedIn && ( // /add ro bayad dorost koni
        <Link to='addPage' className="add-button">
          <i className="bi bi-plus"></i>
        </Link>

      )}
    </>
  );
}

function PageRow(props) {

  

  return (
    <>
      <dt>
        Page #{props.page.id}: <Link to={`/pages/${props.page.id}`}>{props.page.title}</Link>
      </dt>
      <dd>
        Written by {props.page.author} created at {props.page.creationDate.format('YYYY-MM-DD')}
      </dd>
      <dd>
         publication Date: {props.page.publicationDate.format('YYYY-MM-DD')}
      </dd>
      
    </>
  );
}




