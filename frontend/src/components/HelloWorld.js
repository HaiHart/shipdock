import React, { useState} from 'react';
import Modal from 'react-modal';
import Mold from './DropMold';


function HelloWorld() {

	const [showModal, setShowModal] = useState(false);
	const [result, setResult] = useState(null);
	
	const handleOpenModal = () => {
		setShowModal(true);

		window.backend.action("Ho Vu Dai Hai").then((result) => {console.log('yes') 
		setResult(result)});
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	return (
		<div className="App">
			<button onClick={() => handleOpenModal() } type="button">
				Hello
      		</button>
			<Modal
				appElement={document.getElementById("app")}
				isOpen={showModal}
				contentLabel="Minimal Modal Example"
			>
				<p>{result}</p>
				<button onClick={() => handleCloseModal()}>Close Modal</button>
				<Mold/>
			</Modal>
			
		</div>
	);
}

export default HelloWorld;
