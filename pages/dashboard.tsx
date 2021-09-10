import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { api } from "../services/apiClient";
import { setupAPIClient } from "../services/api";
import { witchSSRAuth } from "../utils/withSSTAuth";

export default function Dashboard(){
    const {user} = useContext(AuthContext);

    useEffect(() => {
        api.get('/me')
        .then(response => console.log(response))
        .catch((err) => console.log(err))
    },[])
    return(
        <h1>Ola {user?.email}</h1>
    )
}
export const getServerSideProps = witchSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me');
  
    console.log(response.data);
  
    return {
      props: {}
    }
  })