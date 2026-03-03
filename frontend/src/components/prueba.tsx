type PruebaProps = {
    name: string
    msgCount: number
    isLoggedIn: boolean
}

export const Prueba = (props: PruebaProps) => {
    return (
        <div>
            <h2>
                {props.isLoggedIn 
                ? `Welcome ${props.name}! You have ${props.msgCount} unread messages.` 
                : `Welcome Guest!`
                }
                </h2>
        </div>
)}