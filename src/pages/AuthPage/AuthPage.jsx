import Login from '../../components/Login/Login'; // Компонент для входа
import Registration from '../../components/Register/Register'; // Компонент для регистрации

const AuthPage = ({isLogin}) => {

    return (
        <div className='auth-page-container'>
            <div className='auth-form'>
                {isLogin ? (
                    <>
                        <Login />                        
                    </>
                ) : (
                    <>
                        <Registration />                        
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
