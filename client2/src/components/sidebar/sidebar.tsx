import { Listbox, Transition } from '@headlessui/react'
import React, { Fragment, useEffect } from 'react'
import { BATTLECODE_YEAR } from '../../constants'
import { ThreeBarsIcon } from '../../icons/three-bars'
import { GamePage } from './game/game'
import { QueuePage } from './queue/queue'
import { TbSelector } from 'react-icons/tb'
import { BsChevronLeft } from 'react-icons/bs'
import { HelpPage } from './help/help'
import { MapEditorPage } from './map-editor/map-editor'
import { ProfilerPage } from './profiler/profiler'
import { RunnerPage } from './runner/runner'
import { usePage, PageType, useSearchParamBool } from '../../app-search-params'
import { useKeyboard } from '../../util/keyboard'
import { Scrollbars } from 'react-custom-scrollbars-2'
import useWindowDimensions from '../../util/window-size'
import { TournamentPage } from './tournament/tournament'

const SIDEBAR_BUTTONS: { name: string; page: PageType }[] = [
    { name: 'Game', page: PageType.GAME },
    { name: 'Queue', page: PageType.QUEUE },
    { name: 'Runner', page: PageType.RUNNER },
    { name: 'Profiler', page: PageType.PROFILER },
    { name: 'Map Editor', page: PageType.MAP_EDITOR },
    { name: 'Help', page: PageType.HELP }
]

export const Sidebar: React.FC = () => {
    const { width, height } = useWindowDimensions()
    const [page, setPage] = usePage()
    const keyboard = useKeyboard()

    const [open, setOpen] = useSearchParamBool('sidebarOpen', true)
    const [expanded, setExpanded] = React.useState(false)

    const minWidth = open ? 'min-w-[390px]' : 'min-w-[64px]'
    const maxWidth = open ? 'max-w-[390px]' : 'max-w-[64px]'

    const [tournamentMode, setTournamentMode] = useSearchParamBool('tournament', false)

    const renderPage = () => {
        if (!open) return undefined

        switch (page) {
            default:
                return undefined
            case PageType.GAME:
                return <GamePage />
            case PageType.QUEUE:
                return <QueuePage />
            case PageType.RUNNER:
                return <RunnerPage />
            case PageType.PROFILER:
                return <ProfilerPage />
            case PageType.MAP_EDITOR:
                return <MapEditorPage />
            case PageType.HELP:
                return <HelpPage />
            case PageType.TOURNAMENT:
                return <TournamentPage />
        }
    }

    // If you find a better way of doing this, change this. Skip going through
    // map and help tab, it's annoying for competitors.
    const getNextPage = (currentPage: PageType, previous: boolean) => {
        switch (currentPage) {
            default:
                return currentPage
            case PageType.GAME:
                return previous ? PageType.PROFILER : PageType.QUEUE
            case PageType.QUEUE:
                return previous ? PageType.GAME : PageType.RUNNER
            case PageType.RUNNER:
                return previous ? PageType.QUEUE : PageType.PROFILER
            case PageType.PROFILER:
                return previous ? PageType.RUNNER : PageType.GAME
        }
    }

    const updatePage = (newPage: PageType) => {
        setPage(newPage)
    }

    // Minimize the sidebar buttons when a new one has been selected
    React.useEffect(() => {
        setExpanded(false)
    }, [page])

    React.useEffect(() => {
        if (keyboard.keyCode === 'Backquote') updatePage(getNextPage(page, false))

        if (keyboard.keyCode === 'ShiftLeft') updatePage(PageType.QUEUE)

        if (keyboard.keyCode === 'Digit1') updatePage(getNextPage(page, true))
    }, [keyboard.keyCode])

    const activeSidebarButtons = React.useMemo(() => {
        if (tournamentMode) {
            return [
                { name: 'Game', page: PageType.GAME },
                { name: 'Queue', page: PageType.QUEUE },
                { name: 'Tournament', page: PageType.TOURNAMENT }
            ]
        }
        return SIDEBAR_BUTTONS
    }, [tournamentMode])

    return (
        <div
            className={`${minWidth} ${maxWidth} bg-light text-black h-screen transition-[min-width,max-width] overflow-hidden`}
        >
            <Scrollbars
                universal={true}
                autoHide
                autoHideTimeout={1000}
                autoHideDuration={200}
                autoHeight
                autoHeightMax={height}
                autoHeightMin={height}
            >
                <div className="flex flex-col gap-2 p-3">
                    <div className="flex justify-between">
                        {open && (
                            <p className="p-2 whitespace-nowrap font-extrabold text-xl">{`BATTLECODE ${BATTLECODE_YEAR}`}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setOpen(!open)}
                                className="p-2 hover:bg-lightHighlight rounded-md"
                                style={{
                                    width: '40px',
                                    height: '40px'
                                }}
                            >
                                {open ? <BsChevronLeft className="mx-auto font-bold stroke-2" /> : <ThreeBarsIcon />}
                            </button>
                        </div>
                    </div>
                    {open && (
                        <>
                            <Listbox value={page} onChange={updatePage}>
                                <Listbox.Button className="text-left flex flex-row justify-between hover:bg-lightHighlight p-3 rounded-md border-black border">
                                    {page}
                                    <TbSelector className="text-2xl align-middle" />
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition-all ease-out overflow-hidden duration-100"
                                    enterFrom="transform scale-95 opacity-0 max-h-0"
                                    enterTo="transform scale-100 opacity-100 max-h-96"
                                    leave="transition-all ease-in overflow-hidden duration-50"
                                    leaveFrom="transform scale-100 opacity-100 max-h-96"
                                    leaveTo="transform scale-95 opacity-0 max-h-0"
                                >
                                    <Listbox.Options>
                                        {activeSidebarButtons.map((data) => {
                                            return (
                                                <Listbox.Option
                                                    key={data.page}
                                                    value={data.page}
                                                    className="text-left hover:bg-lightHighlight p-3 py-1 rounded-md cursor-pointer"
                                                >
                                                    {data.name}
                                                </Listbox.Option>
                                            )
                                        })}
                                    </Listbox.Options>
                                </Transition>
                            </Listbox>

                            {/* spacing */}
                            <div className="mt-1"></div>

                            {renderPage()}
                        </>
                    )}
                </div>
            </Scrollbars>
        </div>
    )
}
