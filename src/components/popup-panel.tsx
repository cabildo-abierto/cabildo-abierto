
import CloseIcon from '@mui/icons-material/Close';

const PopupPanel: React.FC<any> = ({children, onClose}) => {
    return <div className="fixed w-screen h-screen z-100">
    <div className="flex justify-center items-center h-screen z-100">
      <div className="relative panel bg-[var(--background)] p-8 rounded-lg w-[300px] z-100">

          <button
              className="absolute top-2 right-2"
              onClick={onClose}
          >
              <CloseIcon/>
          </button>

          <h1 className="text-2xl font-semibold mb-4">Crear entidad</h1>

          {children}
      </div>
    </div>
  </div>
}

export default PopupPanel