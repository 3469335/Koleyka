import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { canEditZapis, canDeleteZapis, canViewOnlyOwnZapis } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

// PUT - обновление записи
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserSession()
    
    if (!user || !canEditZapis(user)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Для User4 проверяем, что это его запись
    if (canViewOnlyOwnZapis(user)) {
      const zapis = await prisma.zapis.findUnique({
        where: { id: params.id },
      })

      if (!zapis || zapis.name !== user.name) {
        return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { number, name, trans, mestoR, srokDost, datObr, timObr, datRazm, timRazm, telephon, status, prim } = body

    const zapis = await prisma.zapis.update({
      where: { id: params.id },
      data: {
        number: number ? parseInt(number) : undefined,
        name: name ? name.trim() : undefined,
        trans: trans ? trans.trim() : undefined,
        mestoR: mestoR !== undefined ? (mestoR && mestoR.trim() ? mestoR.trim() : 'Рампа2') : undefined,
        srokDost: srokDost ? new Date(srokDost) : srokDost === null ? null : undefined,
        datObr: datObr ? new Date(datObr) : datObr === null ? null : undefined,
        timObr: timObr !== undefined ? timObr : undefined,
        datRazm: datRazm ? new Date(datRazm) : datRazm === null ? null : undefined,
        timRazm: timRazm !== undefined ? timRazm : undefined,
        telephon: telephon !== undefined ? telephon : undefined,
        status: status !== undefined ? status : undefined,
        prim: prim !== undefined ? (prim !== null && prim !== '' ? prim.trim() : null) : undefined,
      },
    })

    return NextResponse.json({ success: true, data: zapis })
  } catch (error: any) {
    console.error('Ошибка при обновлении записи zapis:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении записи', message: error.message },
      { status: 500 }
    )
  }
}

// DELETE - удаление записи
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserSession()
    
    if (!user || !canDeleteZapis(user)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    await prisma.zapis.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ошибка при удалении записи zapis:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении записи', message: error.message },
      { status: 500 }
    )
  }
}
