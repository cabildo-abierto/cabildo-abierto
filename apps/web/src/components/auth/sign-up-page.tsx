import {Logo} from "@/components/utils/icons/logo";
import {Note} from "../utils/base/note";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {BaseButton} from "@/components/utils/base/base-button";
import {LoginModalPage} from "@/components/auth/login-modal";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import {useState} from "react";
import {AtIcon, EyeClosedIcon, EyeIcon} from "@phosphor-icons/react";
import {isValidHandle} from "@atproto/syntax";
import {DateAndTimePicker} from "@/components/tema/props/date-prop-editor";
import {post} from "@/components/utils/react/fetch";
import {SignupOutput, SignupParams} from "@cabildo-abierto/api";
import {StateButton, StateButtonClickHandler} from "@/components/utils/base/state-button";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {isValidEmail} from "@/components/feed/config/account-settings";
import {ErrorMsg} from "@/components/utils/utils";
import {useRouter} from "next/navigation";



const SignUpForm = ({
                              data,
                              setData,
                              onClickBack,
                              onSubmit
                          }: {
    data: SignupParams
    setData: (d: SignupParams) => void
    onClickBack: () => void
    onSubmit: StateButtonClickHandler
}) => {
    const [pwVisible, setPwVisible] = useState<boolean>(false)
    const validHandle = isValidHandle(data.handle)
    const validEmail = isValidEmail(data.email)
    const validPw = data.password.length > 0
    const valid = validHandle && validEmail && validPw

    return <div className={"py-4 w-full flex flex-col items-center"}>
        <div className={"max-w-72 space-y-4"}>
            <BaseTextField
                value={data.email}
                onChange={e => {
                    setData({...data, email: e.target.value})
                }}
                type={"email"}
                label={"Correo electrónico"}
                placeholder={""}
            />

            <BaseTextField
                value={data.password}
                type={pwVisible ? "text" : "password"}
                onChange={e => {
                    setData({...data, password: e.target.value})
                }}
                label={"Contraseña"}
                placeholder={""}
                endIcon={<BaseIconButton
                    size={"small"}
                    className={"rounded-full mr-1"}
                    onClick={() => {
                        setPwVisible(!pwVisible)
                    }}
                >
                    {!pwVisible ? <EyeIcon/> : <EyeClosedIcon/>}
                </BaseIconButton>}
            />

            <DateAndTimePicker
                time={false}
                value={data.dateOfBirth}
                onChange={e => {
                    setData({...data, dateOfBirth: e})
                }}
                label={"Fecha de nacimiento"}
                buttonClassName={"w-72"}
            />

            <BaseTextField
                value={data.handle.replace(".cabildo.ar", "")}
                onChange={e => {
                    setData({...data, handle: e.target.value + ".cabildo.ar"})
                }}
                startIcon={<AtIcon/>}
                label={"Nombre de usuario"}
                placeholder={""}
            />

            {!validHandle && data.handle.replace(".cabildo.ar", "").length > 0 && <ErrorMsg
                className={"text-xs"}
                text={"El nombre de usuario es inválido."}
            />}

            {validHandle && <Note className={"text-xs"}>
                Tu nombre de usuario va a ser <span className={"font-medium"}>{data.handle}</span>
            </Note>}

            <div className={"flex justify-between space-x-2 pt-4"}>
                <BaseButton
                    variant={"outlined"}
                    className={"w-full text-[13px] max-w-28"}
                    onClick={onClickBack}
                >
                    Cancelar
                </BaseButton>

                <StateButton
                    variant={"outlined"}
                    className={"w-64"}
                    disabled={!valid}
                    handleClick={onSubmit}
                >
                    Crear cuenta
                </StateButton>
            </div>
        </div>
    </div>
}


export const SignUpPage = ({
                               inviteCode,
                               setPage
                           }: {
    inviteCode?: string
    setPage: (v: LoginModalPage) => void
}) => {
    const router = useRouter()
    const [data, setData] = useState<SignupParams>({
        handle: "",
        email: "",
        dateOfBirth: new Date(Date.now() - 18 * (365 * 24 + 1) * 60 * 60 * 1000),
        password: "",
        code: inviteCode
    })

    async function onSubmit() {
        const res = await post<SignupParams, SignupOutput>("/signup", data)
        if(res.success === true && res.value.redirectUrl) {
            router.push(res.value.redirectUrl)
        }
        return res.success === true ? {} : {error: res.error}
    }

    return <div className={"space-y-4 flex flex-col items-center pt-4"}>
        <div className="space-y-4 flex flex-col items-center">
            <Logo width={64} height={64}/>
            <h1 className={"text-lg font-semibold uppercase"}>Registro</h1>
        </div>

        <div className="flex justify-center sm:px-8">
            <div className="w-full flex flex-col items-center space-y-4 px-2 mb-4">
                <div className={""}>
                    <SignUpForm
                        data={data}
                        setData={setData}
                        onClickBack={() => {
                            setPage("login")
                        }}
                        onSubmit={onSubmit}
                    />
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