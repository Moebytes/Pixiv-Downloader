import {configureStore} from "@reduxjs/toolkit"
import themeReducer, {useThemeSelector, useThemeActions} from "./reducers/themeReducer"
import actionReducer, {useActionSelector, useActionActions} from "./reducers/actionReducer"
import searchReducer, {useSearchSelector, useSearchActions} from "./reducers/searchReducer"

const store = configureStore({
    reducer: {
        theme: themeReducer,
        action: actionReducer,
        search: searchReducer
    },
})

export type StoreState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch

export {
    useThemeSelector, useThemeActions,
    useActionSelector, useActionActions,
    useSearchSelector, useSearchActions
}

export default store