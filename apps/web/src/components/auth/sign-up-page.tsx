import {Logo} from "@/components/utils/icons/logo";
import { Note } from "../utils/base/note";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {BaseButton} from "@/components/utils/base/base-button";
import {LoginModalPage} from "@/components/auth/login-modal";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import {useState} from "react";
import { AtIcon } from "@phosphor-icons/react";
import {isValidHandle} from "@atproto/syntax";
import {DateAndTimePicker} from "@/components/tema/props/date-prop-editor";
import {post} from "@/components/utils/react/fetch";
import {SignupParams} from "@cabildo-abierto/api";
import {StateButton, StateButtonClickHandler} from "@/components/utils/base/state-button";




const SignUpHandleStage = ({
    data,
    setData,
    onSubmit
                          }: {
    data: SignupParams
    setData: (d: SignupParams) => void
    onSubmit: StateButtonClickHandler
}) => {
    const fullHandle = data.handle+".cabildo.ar"
    const valid = isValidHandle(fullHandle)

    return <div className={"pt-4 w-full space-y-4 flex flex-col items-center"}>
        <BaseTextField
            value={data.handle}
            onChange={e => {
                setData({...data, handle: e.target.value})
            }}
            startIcon={<AtIcon/>}
            label={"Nombre de usuario"}
            placeholder={""}
            className={"w-64"}
        />

        {valid && <Note className={"text-xs"}>
            Tu nombre de usuario va a ser <span className={"font-medium"}>{fullHandle}</span>
        </Note>}

        <StateButton
            size={"small"}
            variant={"outlined"}
            className={"w-64"}
            handleClick={onSubmit}
        >
            Crear cuenta
        </StateButton>
    </div>
}


const SignUpStartStage = ({
    data,
    setData,
    onClickContinue
                          }: {
    data: SignupParams
    setData: (d: SignupParams) => void
    onClickContinue: () => void
}) => {
    return <div className={"pt-4 w-full space-y-4"}>

        <BaseTextField
            value={data.email}
            onChange={e => {
                setData({...data, email: e.target.value})
            }}
            label={"Correo electrónico"}
            placeholder={""}
        />

        <BaseTextField
            value={data.password}
            type={"password"}
            onChange={e => {
                setData({...data, password: e.target.value})
            }}
            label={"Contraseña"}
            placeholder={""}
        />

        <DateAndTimePicker
            time={false}
            value={data.dateOfBirth}
            onChange={e => {
                setData({...data, dateOfBirth: e})
            }}
            label={"Fecha de nacimiento"}
            buttonClassName={"w-64"}
        />

        <BaseButton
            variant={"outlined"}
            className={"w-full text-[13px]"}
            onClick={onClickContinue}
        >
            Siguiente
        </BaseButton>
    </div>
}



export const SignUpPage = ({
    inviteCode,
    setPage
                           }: {
    inviteCode?: string
    setPage: (v: LoginModalPage) => void
}) => {
    const [stage, setStage] = useState<"start" | "handle">("start")
    const [data, setData] = useState<SignupParams>({
        handle: "",
        email: "",
        dateOfBirth: new Date(Date.now()-18*(365*24+1)*60*60*1000),
        password: ""
    })

    async function onSubmit() {
        const res = await post("/signup", data)
        return res.success === true ? {} : {error: res.error}
    }

    return <div className={"space-y-4 flex flex-col items-center pt-4"}>
        <div className="space-y-4 flex flex-col items-center">
            <Logo width={64} height={64}/>
            <h1 className={"text-lg font-bold uppercase"}>Crear una cuenta</h1>
        </div>

        <div className="flex justify-center sm:px-8">
            <div className="w-full flex flex-col items-center space-y-4 px-2 mb-4">
                {inviteCode && <div
                    className={"flex flex-col space-y-4 items-center max-w-80 text-center"}>
                    <div className={"text-base"}>
                        ¡Recibiste un código de invitación!
                    </div>
                    <Note text={"text-sm"}>
                        Si ya tenés una cuenta de Bluesky, iniciá sesión directamente. Si no, <Link
                        className={"link2"} target={"_blank"} href={"https://bsky.app"}>creala primero acá</Link> y
                        después volvé a esta página.
                    </Note>
                </div>}

                <div className={"max-w-[360px]"}>

                    {stage == "start" && <SignUpStartStage
                        data={data}
                        setData={setData}
                        onClickContinue={() => {setStage("handle")}}
                    />}

                    {stage == "handle" && <SignUpHandleStage
                        data={data}
                        setData={setData}
                        onSubmit={onSubmit}
                    />}

                    {/*!inviteCode && <div className={"pt-4 w-full"}>
                            <BaseButton
                                variant={"outlined"}
                                className={"w-full text-[13px]"}
                                onClick={() => {
                                    setAccessRequest(true)
                                }}
                            >
                                Participar en el acceso anticipado
                            </BaseButton>
                        </div>*/}
                </div>

                <div className={"font-extralight pt-2 flex flex-col space-y-4 pb-2 items-center text-center"}>
                    <Note
                        text={"text-xs"}
                    >
                        Al crear la cuenta aceptás los <Link
                        target="_blank"
                        className="hover:underline hover:text-[var(--text)]"
                        href={topicUrl("Cabildo Abierto: Términos y condiciones")}
                    >
                        Términos y condiciones</Link> y la <Link
                        target="_blank"
                        className="hover:underline hover:text-[var(--text)]"
                        href={topicUrl("Cabildo Abierto: Política de privacidad")}>
                        Política
                        de privacidad</Link>, ¡leelos!.
                    </Note>
                </div>
            </div>
        </div>
    </div>
}