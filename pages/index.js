/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className='max-w-sm'>
        
        <div className='flex flex-wrap'>
          <Link href="/scale/xiaomi" passHref className='m-5 w-full mr-auto ml-auto'>
            <button
              type="button"
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
            >  Mi Scale Scanner
            </button>
          </Link>
         
        </div>
      </div>
    </>
  )
}
