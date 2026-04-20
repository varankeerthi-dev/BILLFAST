import { hydrateRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './routeTree.gen'

hydrateRoot(document.getElementById('root')!, <RouterProvider router={router} />)
