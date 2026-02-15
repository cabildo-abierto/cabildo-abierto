import {AtIcon} from "@phosphor-icons/react";
import {useBlueskyLogin} from "./bsky-login";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {BaseButton} from "@/components/utils/base/base-button";
import {FieldError} from "@/components/utils/ui/field";
import {Note} from "@/components/utils/base/note";
import {useSession} from "@/components/auth/use-session";

export const BlueskyLogin = ({
                                 inviteCode,
                                 onLogin
                             }: {
    inviteCode?: string
    onLogin?: () => void
}) => {
    const {
        handleSubmit,
        error,
        isLoading,
        setHandleStart,
        setDomain,
        domain,
        handleStart
    } = useBlueskyLogin({inviteCode, onLogin})
    const {isFetching} = useSession()

    return <div className={"max-w-96 w-full"}>
        <form
            action={"/login"}
            autoComplete={"on"}
            onSubmit={handleSubmit}
            className={"space-y-4"}
        >
            <div className={"space-y-2"}>
                <div className={"flex space-x-2 items-center"}>
                    <BaseTextField
                        name="ca_username"
                        id="ca_username"
                        autoComplete="username"
                        label="Nombre de usuario"
                        autoFocus
                        value={handleStart}
                        onChange={(e) => {
                            setHandleStart(e.target.value)
                        }}
                        startIcon={<span className={"text-[var(--text-light)] pt-[2px]"}><AtIcon/></span>}
                    />
                    <BaseTextField
                        id="domain"
                        label="Dominio"
                        placeholder=".bsky.social"
                        autoFocus={false}
                        autoComplete="off"
                        value={domain}
                        onChange={(e) => {
                            setDomain(e.target.value)
                        }}
                        className={"w-40"}
                    />
                </div>
                {error && <FieldError>
                    {error}
                </FieldError>}
                <Note text={"text-xs"}>
                    Tu cuenta de Cabildo Abierto y Bluesky es la misma.
                </Note>
            </div>
            <BaseButton
                type="submit"
                loading={isLoading || isFetching}
                variant="outlined"
                className={"w-full"}
            >
                Iniciar sesión
            </BaseButton>
        </form>
    </div>
}