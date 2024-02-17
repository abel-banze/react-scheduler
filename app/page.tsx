'use client'
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FaRegCalendarXmark } from "react-icons/fa6";
import { useState, Fragment } from "react"
import { Dialog, Transition } from '@headlessui/react'
import type { DatePickerProps } from 'antd';
import { DatePicker } from 'antd';
import dayjs from "dayjs"
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { notification } from "antd"
import { Bars } from "react-loader-spinner"

dayjs.extend(customParseFormat);

type INFO_TYPE = {
    title?: string;
    description?: string;
    eventDay?: any
}


const INITIAL_STATE = {
    title: '',
    description:'',
    eventDay: new Date()
}

const INITIAL_STATE_EVENTS = [
    { title: 'Apresentacao', description: 'Fazer a apresentacao do projecto ALPHA.', date: '2024-02-20 08:30:00' },
    { title: 'Encontro', description: 'Encontro para a aprovacao do projecto ALPHA.', date: '2024-02-20 14:00:00' },
    { title: 'Apresentacao', description: 'Apresentacao do prototipo.', date: '2024-02-08' },
]

export default function Scheduler(){
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showEvents, setShowEvents] = useState<string[] | null>(null)
    const [info, setInfo] = useState<INFO_TYPE | null>(INITIAL_STATE)
    const [selectedDate, setSelectedDate] = useState<number>(currentMonth.getDay());
    const [api, contextHolder] = notification.useNotification()
    const [eventsData, setEventsData] = useState(INITIAL_STATE_EVENTS)


    const handleModal = (e: any) => {
        setIsOpen(!isOpen);
        if(e != null){
            if(e?.events != undefined && e?.events.length > 0){
                setShowEvents(e.events)
            }else{
                setShowEvents(null)
            }
    
            setSelectedDate(e.day > 0 ? e.day : currentMonth.getDay());

            const d = dayjs(`${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`, 'YYYY-MM-DD');

            setInfo({
                ...info,
                eventDay: d.toDate()
            })
        }
    }

    const addEventModal = () => {
        setAddOpen(!addOpen);
    }

    const handleEvent = () =>{
        setIsOpen(!isOpen);
        setAddOpen(!addOpen);
    }

    const handleDate: DatePickerProps['onChange'] =(date, dateString) => {
        if(date != null){
            setInfo({
                ...info,
                eventDay: date.toDate()
            });
        }
    }


    // submeter o formulario para criacao do evento
    const submit = async () => {
        setLoading(true);

        const newEvent = {
          title: info?.title,
          description: info?.description,
          date: info?.eventDay
        };

        setEventsData((prevEventsData?: any) => [...prevEventsData, newEvent]);

        setLoading(false)
        setAddOpen(false)

        api['success']({
          message: 'Evento adicionado com sucesso.',
          description: 'Agora o seu evento está associado a data na qual foi adicionado.'
        })
        
    }

    const getDaysInMonth = (date: any) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (date: any) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const todayEvents = eventsData.filter(event => {
      const eventDate = new Date(event.date);
      const todayDate = new Date();
      return eventDate.toDateString() === todayDate.toDateString();
    });

    const renderTodayEvents = () => {
      if (todayEvents.length > 0) {
          return (
              <div className="w-full flex flex-col gap-3">
                  {todayEvents.map((event: any, index: any) => (
                      <div key={index} className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 flex flex-col">
                          <h1 className="text font-bold"> {event.title} </h1>
                          <p className="text-xs">
                              {event.description}
                          </p>
                      </div>
                  ))}
              </div>
          );
      } else {
          return (
              <div className="p-5 rounded-xl bg-slate-100 dark:bg-zinc-800 h-30 flex flex-col gap-3 items-center justify-center text-center">
                  <FaRegCalendarXmark className="text-5xl text-gray-500" />
                  <span>
                      Nenhum evento agendado para hoje. <br /> Clique no botão abaixo para adicionar um evento.
                  </span>
              </div>
          );
      }
    };

    const calendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
        const days = [];
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonthIndex = today.getMonth();

        for (let i = 1; i <= daysInMonth + firstDayOfMonth; i++) {
            if (i > firstDayOfMonth) {
              const dayDate: Date = new Date(currentYear, currentMonthIndex, i - firstDayOfMonth);
              const isToday = dayDate.toDateString() === today.toDateString();
              const isInCurrentMonth = dayDate.getMonth() === currentMonth.getMonth();

              // Filtra os eventos para o dia atual
              const eventsForDay = eventsData.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.toDateString() === dayDate.toDateString();
              });
        
              days.push({ day: i - firstDayOfMonth, isToday,isInCurrentMonth , events: eventsForDay });
            } else {
              days.push(null);
            }
        }

        return (
            <>
                <div className="w-full lg:w-9/12 h-full flex flex-col">
                    <div className="w-full h-10 bg-slate-200 dark:bg-zinc-800 flex flex-row items-center justify-between px-10 rounded-tr-xl p-5">
                        <div className="w-4/12 flex flex-row gap-3">
                            <h1 className="font-bold text-lg"> {currentMonth.getFullYear()} </h1>
                            <h1 className="font-bold text-lg"> { months[currentMonth.getMonth()] } </h1>
                            <div className="flex flex-row gap-2 items-center">
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                    className="rounded-lg p-2 bg-slate-100 dark:bg-zinc-700"
                                >
                                    <MdOutlineKeyboardArrowLeft />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                    className="rounded-lg p-2 bg-slate-100 dark:bg-zinc-700"
                                >
                                    <MdOutlineKeyboardArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-7">
                        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                            <div key={dayIndex} className="border text-sm text-center p-2 border-slate-200 dark:border-gray-700">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayIndex]}
                            </div>
                        ))}
                    </div>

                    <div className="w-full grid grid-cols-7">
                        {days.map((dayData: any, index: any) => (
                            <div key={index} onClick={()=>handleModal(dayData)} className={`w-full relative ${dayData?.isToday && dayData?.isInCurrentMonth && 'bg-teal-600 text-white'} hover:bg-slate-200 dark:hover:bg-zinc-600 cursor-pointer transition ease-in-out duration-200 border border-slate-200 dark:border-gray-700 h-16 lg:h-28`}>
                                { dayData?.day }

                                {dayData?.events && dayData.isInCurrentMonth && dayData.events.length > 0 && (
                                    <div  className={`w-full absolute ${dayData?.isToday ? 'bg-gray-700' : 'bg-red-400'} text-white bottom-0 text-sm p-2`}>
                                        <span className="hidden lg:flex">{dayData.events.length} eventos</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            { contextHolder }

            <div className="w-full h-full flex flex-row rounded-xl bg-slate-100 dark:bg-zinc-900 backdrop-blur bg-opacity-70">
                <div className="hidden lg:flex flex-col gap-3 w-3/12 h-full p-5 border-r border-slate-200 dark:border-gray-700">
                    <h1 className="text-2xl font-semibold">Agenda</h1>

                    <button
                        type="button"
                        onClick={addEventModal}
                        className="text-sm mt-5 mb-10 bg-teal-600 text-white rounded-xl px-5 p-2 hover:bg-teal-800"
                    >
                        Criar evento
                    </button>
                    <legend className=" text-gray-500 text-lg">Eventos de hoje</legend>
                    <div className="w-full flex flex-col gap-3">
                        { renderTodayEvents() }
                    </div>
                    
                </div>
                { calendar() }
            </div>

            <Transition
                appear
                show={isOpen}
                as={Fragment}
            >
                <Dialog
                as="div"
                className="relative z-10"
                onClose={handleModal}
                >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur " />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title
                            as="h3"
                            className="text-lg font-bold leading-6 text-gray-900"
                        >
                            Eventos do dia
                        </Dialog.Title>
                        <div className="mt-2">
                            <form className="flex flex-col">

                                <div className="w-full mt-5 px-3 flex h-[40vh] overflow-y-scroll text-gray-700 flex-col gap-2">
                                    {showEvents != null ? (
                                        showEvents.map((event: any, index: any)=>(
                                            <div key={index} className="p-2 rounded-xl bg-slate-100 flex flex-col">
                                                <h1 className="text font-bold"> {event.title} </h1>
                                                <p className="text-xs">
                                                    { event.description }
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="p-5 rounded-xl bg-slate-100 h-30 flex flex-col gap-3 items-center justify-center text-center">
                                                <FaRegCalendarXmark className="text-5xl text-gray-500" />
                                                <span>
                                                   Nenhum evento agendado para o dia de hoje. <br/> Clique no botão abaixo para adicionar um evento.
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button 
                                    type="button"
                                    onClick={handleEvent}
                                    className="mt-3 p-2 border-0 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition ease-in-out duration-200">
                                    { loading ? <Bars height="20" width="100" ariaLabel="bars-loading" visible={true} wrapperStyle={{}} wrapperClass="" color="white" /> : 'Adicionar evento' }
                                </button>
                            </form>
                        </div>
                        </Dialog.Panel>
                    </Transition.Child>
                    </div>
                </div>
                </Dialog>
            </Transition>

            <Transition
                appear
                show={addOpen}
                as={Fragment}
            >
                <Dialog
                as="div"
                className="relative z-10"
                onClose={addEventModal}
                >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur " />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title
                            as="h3"
                            className="text-lg font-medium leading-6 text-gray-900"
                        >
                            Adicionar evento
                        </Dialog.Title>
                        <div className="mt-2">
                            <form className="w-full flex flex-col gap-5">
                            
                                <div className="w-full flex flex-col gap-2 mt-5">

                                    <DatePicker 
                                        size="large" 
                                        defaultValue={dayjs(`${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`, 'YYYY-MM-DD')} 
                                        format="YYYY-MM-DD"
                                        onChange={handleDate} 
                                    />

                                    <input 
                                        type="text"
                                        onChange={(e) => setInfo({...info, title: e.target.value})}
                                        placeholder="Título do evento"
                                        className="p-2 w-full bg-transparent px-5 text-gray-700 focus:outline-none border border-slate-200 rounded-lg" 
                                    />

                                    <textarea onChange={(e) => setInfo({...info, description: e.target.value})} className="p-2 rounded-lg border border-slate-200 h-44 text-gray-700 focus:outline-none" placeholder="Descrição do evento"></textarea>
                                </div>
                            

                                <button 
                                    type="button"
                                    onClick={submit}
                                    className="mt-3 p-2 border-0 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition ease-in-out duration-200">
                                    { loading ? <Bars height="20" width="100" ariaLabel="bars-loading" visible={true} wrapperStyle={{}} wrapperClass="" color="white" /> : 'Adicionar evento' }
                                </button>
                            </form>
                        </div>
                        </Dialog.Panel>
                    </Transition.Child>
                    </div>
                </div>
                </Dialog>
            </Transition>
        </>
    )
}