import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma-db'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableName, dbType, data } = body

    if (!tableName || !data) {
      return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 })
    }

    const prisma = getPrismaClient(dbType as 'local' | 'production')

    // Находим модель
    const model = Prisma.dmmf.datamodel.models.find(
      (m) => m.dbName === tableName || m.name.toLowerCase() === tableName.toLowerCase()
    )

    if (!model) {
      return NextResponse.json({ error: 'Таблица не найдена' }, { status: 404 })
    }

    const modelName = model.name
    const modelInstance = (prisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)]

    // Для таблицы users преобразуем category в userTypeId
    let preparedData = prepareData(data, model, tableName)
    if (tableName === 'users' && data.category && !preparedData.userTypeId) {
      // Находим категорию по названию
      const category = await prisma.category.findFirst({
        where: { category: data.category },
      })
      if (category) {
        preparedData.userTypeId = category.id
      }
      delete preparedData.category
    }

    // Создаем запись
    const result = await modelInstance.create({
      data: preparedData,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Ошибка при создании записи:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании записи' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableName, dbType, id, data } = body

    if (!tableName || !id || !data) {
      return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 })
    }

    const prisma = getPrismaClient(dbType as 'local' | 'production')

    // Находим модель
    const model = Prisma.dmmf.datamodel.models.find(
      (m) => m.dbName === tableName || m.name.toLowerCase() === tableName.toLowerCase()
    )

    if (!model) {
      return NextResponse.json({ error: 'Таблица не найдена' }, { status: 404 })
    }

    const modelName = model.name
    const modelInstance = (prisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)]

    // Находим поле ID
    const idField = model.fields.find((f) => f.isId)?.name || 'id'

    // Для таблицы users преобразуем category в userTypeId
    let preparedData = prepareData(data, model, tableName)
    if (tableName === 'users' && data.category) {
      // Находим категорию по названию
      const category = await prisma.category.findFirst({
        where: { category: data.category },
      })
      if (category) {
        preparedData.userTypeId = category.id
      }
      delete preparedData.category
    }

    // Обновляем запись
    const result = await modelInstance.update({
      where: { [idField]: id },
      data: preparedData,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Ошибка при обновлении записи:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при обновлении записи' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tableName = searchParams.get('tableName')
    const dbType = searchParams.get('dbType')
    const id = searchParams.get('id')

    if (!tableName || !id) {
      return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 })
    }

    const prisma = getPrismaClient(dbType as 'local' | 'production')

    // Находим модель
    const model = Prisma.dmmf.datamodel.models.find(
      (m) => m.dbName === tableName || m.name.toLowerCase() === tableName.toLowerCase()
    )

    if (!model) {
      return NextResponse.json({ error: 'Таблица не найдена' }, { status: 404 })
    }

    const modelName = model.name
    const modelInstance = (prisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)]

    // Находим поле ID
    const idField = model.fields.find((f) => f.isId)?.name || 'id'

    // Удаляем запись
    await modelInstance.delete({
      where: { [idField]: id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ошибка при удалении записи:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при удалении записи' },
      { status: 500 }
    )
  }
}

// Подготовка данных для вставки/обновления
function prepareData(data: any, model: any, tableName?: string) {
  const prepared: any = {}
  
  for (const field of model.fields) {
    // Пропускаем ID при создании
    if (field.isId && !data[field.name]) {
      continue
    }

    // Пропускаем обратные связи (массивы без relationFromFields)
    if (field.relationName && field.isList && !field.relationFromFields?.length) {
      continue
    }

    // Пропускаем прямые связи (объекты), но обрабатываем foreign key поля
    if (field.relationName && !field.relationFromFields?.length && field.kind === 'object') {
      continue
    }

    // Для таблицы users пропускаем userTypeId, так как он будет установлен через category
    if (tableName === 'users' && field.name === 'userTypeId') {
      continue
    }

    // Обрабатываем даты
    if (field.type === 'DateTime' && data[field.name]) {
      // Для полей srokDost и datObr в таблице zapis устанавливаем время в начало дня
      if (tableName === 'zapis' && (field.name === 'srokDost' || field.name === 'datObr')) {
        // Если пришла строка в формате YYYY-MM-DD, создаем дату в локальном времени
        if (typeof data[field.name] === 'string' && data[field.name].match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = data[field.name].split('-').map(Number)
          const date = new Date(year, month - 1, day, 0, 0, 0, 0)
          prepared[field.name] = date
        } else {
          const date = new Date(data[field.name])
          date.setHours(0, 0, 0, 0)
          prepared[field.name] = date
        }
      } else {
        prepared[field.name] = new Date(data[field.name])
      }
    } else if (data[field.name] !== undefined && data[field.name] !== null && data[field.name] !== '') {
      prepared[field.name] = data[field.name]
    }
  }

  return prepared
}
