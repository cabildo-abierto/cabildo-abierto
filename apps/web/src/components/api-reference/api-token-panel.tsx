"use client";

import {useAuth} from '@/components/auth-provider';
import {ApiTokenManager} from './api-token-manager';

export function ApiTokenPanel() {
    const {user, loading} = useAuth();
    return !loading && user ? <ApiTokenManager key={user.id} userId={user.id}/> : null;
}
