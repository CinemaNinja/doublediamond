(() => {
    const portalHost = 'https://accounts.doublediamondmoving.com';
    const portalUrlKey = 'ddPortalUrl';
    const portalProfileKey = 'ddPortalProfile';

    const elements = {
        accountName: document.getElementById('portalAccountName'),
        empty: document.getElementById('portalEmpty'),
        fallbackLink: document.getElementById('portalFallbackLink'),
        frame: document.getElementById('portalFrame'),
        frameLabel: document.getElementById('portalFrameLabel'),
        loader: document.getElementById('portalLoader'),
        openExternal: document.getElementById('portalOpenExternal'),
        signOut: document.getElementById('portalSignOut'),
        status: document.getElementById('portalStatus'),
        userEmail: document.getElementById('portalUserEmail'),
        userName: document.getElementById('portalUserName'),
        userType: document.getElementById('portalUserType')
    };

    const parseStoredProfile = () => {
        try {
            return JSON.parse(sessionStorage.getItem(portalProfileKey) || '{}');
        } catch {
            return {};
        }
    };

    const isAllowedPortalUrl = (value) => {
        try {
            const url = new URL(value);
            return url.origin === portalHost && /^\/masm-[a-z]+/i.test(url.pathname);
        } catch {
            return false;
        }
    };

    const getPortalUrl = () => {
        const storedUrl = sessionStorage.getItem(portalUrlKey);
        if (storedUrl && isAllowedPortalUrl(storedUrl)) {
            return storedUrl;
        }

        const params = new URLSearchParams(window.location.search);
        const target = params.get('target');
        if (target && isAllowedPortalUrl(target)) {
            sessionStorage.setItem(portalUrlKey, target);
            window.history.replaceState({}, document.title, window.location.pathname);
            return target;
        }

        return '';
    };

    const getDisplayName = (profile) => {
        const parts = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
        return parts || profile.userName || profile.email || 'Customer account';
    };

    const renderProfile = (profile) => {
        const displayName = getDisplayName(profile);
        elements.accountName.textContent = displayName;
        elements.userName.textContent = profile.userName || displayName || '-';
        elements.userType.textContent = profile.userType ? profile.userType.toUpperCase() : '-';
        elements.userEmail.textContent = profile.email || '-';
    };

    const showEmptyState = () => {
        elements.status.textContent = 'Session unavailable';
        elements.empty.hidden = false;
        elements.frame.closest('.portal-frame-wrap').hidden = true;
        elements.loader.classList.add('is-hidden');
    };

    const hydrateFromPortalUrl = (portalUrl, profile) => {
        if (profile.email || profile.userName || profile.userType) {
            return profile;
        }

        if (!portalUrl) {
            return profile;
        }

        const url = new URL(portalUrl);
        return {
            email: url.searchParams.get('email') || '',
            firstName: url.searchParams.get('fname') || '',
            lastName: url.searchParams.get('lname') || '',
            userName: url.searchParams.get('uname') || '',
            userType: url.searchParams.get('utype') || '',
            customerId: url.searchParams.get('cust_id') || '',
            accountId: url.searchParams.get('_id') || ''
        };
    };

    const bootPortal = () => {
        const portalUrl = getPortalUrl();
        const profile = hydrateFromPortalUrl(portalUrl, parseStoredProfile());
        renderProfile(profile);

        elements.signOut.addEventListener('click', () => {
            sessionStorage.removeItem(portalUrlKey);
            sessionStorage.removeItem(portalProfileKey);
            window.location.assign(`${portalHost}/`);
        });

        if (!portalUrl) {
            showEmptyState();
            return;
        }

        elements.openExternal.href = portalUrl;
        elements.fallbackLink.href = portalUrl;
        elements.frame.src = portalUrl;

        elements.frame.addEventListener('load', () => {
            elements.loader.classList.add('is-hidden');
            elements.status.textContent = 'Connected';
            elements.frameLabel.textContent = 'Live account workspace';
        });

        window.setTimeout(() => {
            if (!elements.loader.classList.contains('is-hidden')) {
                elements.frameLabel.textContent = 'Open in a new tab if the workspace is still loading';
            }
        }, 8000);
    };

    bootPortal();
})();
