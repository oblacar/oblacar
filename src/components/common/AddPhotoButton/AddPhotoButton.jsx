import { FaCamera } from 'react-icons/fa';
import './AddPhotoButton.css';

const AddPhotoButton = ({ openFileDialog }) => {
    return (
        <div
            className='multi-photo-btn-add-photos'
            onClick={openFileDialog}
        >
            <FaCamera />
        </div>
    );
};

export default AddPhotoButton;
